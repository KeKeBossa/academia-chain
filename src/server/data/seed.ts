import {
  AssetVisibility,
  CredentialStatus,
  MembershipRole,
  ProposalStatus,
  ReviewStatus,
  ActivityType,
  CollaborationStatus
} from '@prisma/client';
import { prisma } from '../db/client';
import { encryptJson } from '../security/crypto';

const parseAddressList = (value: string | undefined) =>
  value
    ?.split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0) ?? [];

const getDefaultAdmins = () =>
  parseAddressList(process.env.GOVERNANCE_DEFAULT_ADMINS).map((address, index) => ({
    walletAddress: address.toLowerCase(),
    did: `did:pkh:eip155:80002:${address.toLowerCase()}`,
    displayName: index === 0 ? 'Staging DAO Admin' : `DAO Member ${index + 1}`
  }));

export async function ensureSeedData() {
  try {
    const daoCount = await prisma.dao.count();
    if (daoCount > 0) {
      return;
    }

    const adminUsers = getDefaultAdmins();

    if (adminUsers.length === 0) {
      adminUsers.push({
        walletAddress: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        did: 'did:pkh:eip155:80002:0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        displayName: 'Staging DAO Admin'
      });
    }

    const [primaryUser, secondaryUser] = await Promise.all(
      adminUsers.slice(0, 2).map((user, index) =>
        prisma.user.upsert({
          where: { walletAddress: user.walletAddress },
          update: {
            did: user.did,
            displayName: user.displayName,
            role: index === 0 ? MembershipRole.ADMIN : MembershipRole.ADVISOR
          },
          create: {
            walletAddress: user.walletAddress,
            did: user.did,
            displayName: user.displayName,
            role: index === 0 ? MembershipRole.ADMIN : MembershipRole.ADVISOR
          }
        })
      )
    );

    const dao = await prisma.dao.create({
      data: {
        name: 'Staging Quantum Research DAO',
        description: 'Sample DAO seeded for staging demos.',
        metadataCid: 'bafybeigdyrztlgjzkyu6jsprd7dgiuayzja4k3whxubazl6p3c4xbx3c4i',
        governanceConfig: {
          votingDelayBlocks: 1,
          votingPeriodBlocks: 7200,
          quorumFraction: 10
        },
        memberships: {
          create: [
            {
              userId: primaryUser.id,
              role: MembershipRole.ADMIN,
              grantedBy: null
            },
            {
              userId: secondaryUser?.id ?? primaryUser.id,
              role: MembershipRole.ADVISOR,
              grantedBy: primaryUser.id,
              weightOverride: 2
            }
          ]
        }
      },
      include: {
        memberships: true
      }
    });

    const proposal = await prisma.proposal.create({
      data: {
        daoId: dao.id,
        proposerId: primaryUser.id,
        title: 'Adopt Cross-Lab Credential Standard',
        description:
          'Proposal to adopt a unified VC schema across partner labs and roll out within two weeks.',
        status: ProposalStatus.ACTIVE,
        ipfsCid: 'bafybeibwzifey2d4aqjnjipw6l7mckds6xw3x7uzulzwhzr3hj4mr4fl7e',
        votingWindowStart: new Date(Date.now() - 60 * 60 * 1000),
        votingWindowEnd: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    const asset = await prisma.researchAsset.create({
      data: {
        daoId: dao.id,
        ownerId: primaryUser.id,
        proposalId: proposal.id,
        title: 'Modular Quantum Key Distribution Dataset',
        abstract:
          'A curated dataset and replication package for modular quantum key distribution experiments.',
        ipfsCid: 'bafybeifkxsj32d364z7xwppqzfa6yzt3fx6rmjv2vv3v26sghmhycqp4wi',
        artifactHash: '0xa7ae3fd8a63cb1f4ad50fcea90c0c0d5857a1f5aaecf0b6ab8eb75e9787b86df',
        tags: ['quantum', 'security'],
        visibility: AssetVisibility.INTERNAL,
        metadata: {
          datasetSizeMb: 128,
          schemaVersion: '1.0.0'
        }
      }
    });

    await prisma.review.create({
      data: {
        assetId: asset.id,
        reviewerId: secondaryUser?.id ?? primaryUser.id,
        comment: 'Data quality confirmed; recommend sharing with collaborator labs.',
        status: ReviewStatus.APPROVED
      }
    });

    const collaborationPost = await prisma.collaborationPost.create({
      data: {
        daoId: dao.id,
        authorId: primaryUser.id,
        title: 'Call for Quantum Cryptography Contributors',
        body: 'Looking for two researchers to extend the modular QKD dataset with new simulation scenarios.',
        requiredSkills: ['quantum', 'typescript', 'rust'],
        status: CollaborationStatus.OPEN
      }
    });

    await prisma.activityLog.createMany({
      data: [
        {
          daoId: dao.id,
          actorId: primaryUser.id,
          type: ActivityType.COLLABORATION_POSTED,
          targetId: collaborationPost.id,
          metadata: {
            title: collaborationPost.title,
            requiredSkills: collaborationPost.requiredSkills
          }
        },
        {
          daoId: dao.id,
          actorId: primaryUser.id,
          proposalId: proposal.id,
          type: ActivityType.PROPOSAL_CREATED,
          metadata: {
            title: proposal.title
          }
        },
        {
          daoId: dao.id,
          actorId: primaryUser.id,
          assetId: asset.id,
          type: ActivityType.RESEARCH_ASSET_REGISTERED,
          metadata: {
            title: asset.title,
            ipfsCid: asset.ipfsCid
          }
        }
      ]
    });

    const memberIds = await prisma.daoMembership.findMany({
      where: { daoId: dao.id },
      select: { userId: true }
    });

    await prisma.notification.createMany({
      data: memberIds
        .filter((membership) => membership.userId !== primaryUser.id)
        .map((membership) => ({
          userId: membership.userId,
          type: 'COLLABORATION_POST',
          payload: {
            daoId: dao.id,
            collaborationPostId: collaborationPost.id,
            title: collaborationPost.title
          }
        }))
    });

    await prisma.credential.upsert({
      where: {
        userId_type: {
          userId: primaryUser.id,
          type: 'UniversityFacultyCredential'
        }
      },
      update: {
        status: CredentialStatus.VERIFIED,
        issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        issuer: 'did:web:staging.university.example',
        metadata: encryptJson({
          degree: 'PhD in Quantum Information Science',
          institution: 'Staging University'
        })
      },
      create: {
        userId: primaryUser.id,
        type: 'UniversityFacultyCredential',
        status: CredentialStatus.VERIFIED,
        issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        issuer: 'did:web:staging.university.example',
        hash: '0x7e3680c4287c8f833ca6124b1d856663c4d04ce91b45d43d7c4bbefdeadc0de1',
        metadata: encryptJson({
          degree: 'PhD in Quantum Information Science',
          institution: 'Staging University'
        })
      }
    });
  } catch (error) {
    console.warn('Seed data initialization skipped due to error:', error);
  }
}
