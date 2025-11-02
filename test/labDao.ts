import { expect } from 'chai';
import hre from 'hardhat';

const { ethers, network } = hre;

const advanceBlocks = async (count: number) => {
  for (let i = 0; i < count; i += 1) {
    await network.provider.send('evm_mine');
  }
};

const increaseTime = async (seconds: number) => {
  await network.provider.send('evm_increaseTime', [seconds]);
  await network.provider.send('evm_mine');
};

describe('LabDAO governance flow', () => {
  it('executes a timelocked proposal when quorum is reached', async () => {
    const [admin, proposer, voter1, voter2, outsider] = await ethers.getSigners();

    const token = await ethers.deployContract('LabGovernorToken', [admin.address]);
    await token.waitForDeployment();

    const minDelay = 3600;
    const timelock = await ethers.deployContract('TimelockController', [
      minDelay,
      [],
      [],
      admin.address
    ]);
    await timelock.waitForDeployment();

    const votingDelay = 1;
    const votingPeriod = 5;
    const proposalThreshold = ethers.parseEther('10');
    const quorumFraction = 10;

    const dao = await ethers.deployContract('LabDAO', [
      token.getAddress(),
      timelock.getAddress(),
      votingDelay,
      votingPeriod,
      proposalThreshold,
      quorumFraction
    ]);
    await dao.waitForDeployment();

    const proposerRole = await timelock.PROPOSER_ROLE();
    const executorRole = await timelock.EXECUTOR_ROLE();
    const adminRole = await timelock.DEFAULT_ADMIN_ROLE();

    await timelock.grantRole(proposerRole, await dao.getAddress());
    await timelock.grantRole(executorRole, ethers.ZeroAddress);
    await timelock.revokeRole(adminRole, admin.address);

    const vault = await ethers.deployContract('ResearchVault', [timelock.getAddress()]);
    await vault.waitForDeployment();

    const mintAmount = ethers.parseEther('100');

    await token.connect(admin).mint(proposer.address, mintAmount);
    await token.connect(admin).mint(voter1.address, mintAmount);
    await token.connect(admin).mint(voter2.address, mintAmount);

    await token.connect(proposer).delegate(proposer.address);
    await token.connect(voter1).delegate(voter1.address);
    await token.connect(voter2).delegate(voter2.address);

    const targets = [await vault.getAddress()];
    const values = [0];
    const calldata = [vault.interface.encodeFunctionData('setValue', [42])];
    const description = 'Set vault value to 42';

    await expect(
      dao.connect(outsider).propose(targets, values, calldata, description)
    ).to.be.revertedWithCustomError(dao, 'GovernorInsufficientProposerVotes');

    const proposalTx = await dao.connect(proposer).propose(targets, values, calldata, description);
    const proposalReceipt = await proposalTx.wait();
    expect(proposalReceipt?.status).to.equal(1);

    const descriptionHash = ethers.id(description);
    const proposalId = await dao.hashProposal(targets, values, calldata, descriptionHash);

    await advanceBlocks(votingDelay + 1);

    await dao.connect(voter1).castVote(proposalId, 1); // For
    await dao.connect(voter2).castVote(proposalId, 1); // For

    await advanceBlocks(votingPeriod + 1);

    expect(await dao.state(proposalId)).to.equal(4); // Succeeded

    await dao.queue(targets, values, calldata, descriptionHash);

    await increaseTime(minDelay);

    await dao.execute(targets, values, calldata, descriptionHash);

    expect(await vault.value()).to.equal(42);
    expect(await vault.lastUpdatedBy()).to.equal(await timelock.getAddress());
  });
});
