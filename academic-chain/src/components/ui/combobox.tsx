import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "./utils"
import { Button } from "./button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

export interface ComboboxProps {
  options: { label: string; value: string }[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowCustom?: boolean;
  onCustomValue?: (customValue: string) => void;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "選択...",
  searchPlaceholder = "検索...",
  emptyText = "見つかりません",
  allowCustom = false,
  onCustomValue,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
    option.value.toLowerCase().includes(searchValue.toLowerCase())
  )

  const selectedLabel = options.find((opt) => opt.value === value)?.label || value || placeholder

  const handleCustomValue = (customVal: string) => {
    if (customVal.trim()) {
      onValueChange(customVal)
      onCustomValue?.(customVal)
      setSearchValue("")
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {allowCustom && searchValue.trim() ? (
                <button
                  className="relative flex w-full cursor-pointer select-none rounded-sm bg-accent px-2 py-1.5 text-sm outline-none hover:bg-accent/80"
                  onClick={() => handleCustomValue(searchValue)}
                >
                  「{searchValue}」を追加
                </button>
              ) : (
                emptyText
              )}
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setSearchValue("")
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
