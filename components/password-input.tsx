"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"

/** Password field with a show/hide toggle. */
export function PasswordInput(props: Omit<React.ComponentProps<typeof InputGroupInput>, "type">) {
  const [show, setShow] = useState(false)
  return (
    <InputGroup>
      <InputGroupInput type={show ? "text" : "password"} {...props} className="pl-3.5" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-sm" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} onClick={() => setShow((s) => !s)}>
          {show ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
