import type { ButtonHTMLAttributes, ComponentProps, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { useId } from "react";
import { Ionicons } from "@expo/vector-icons";

export type WebIconName = ComponentProps<typeof Ionicons>["name"];

export function Icon({ name, color = "currentColor", size = 19 }: { name: WebIconName; color?: string; size?: number }) {
  return <Ionicons name={name} color={color} size={size} accessible={false} />;
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`tw-panel ${className}`.trim()}>{children}</section>;
}

export function Pill({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "teal" | "muted" | "red" }) {
  return <span className={`tw-pill tw-pill--${tone}`}>{children}</span>;
}

export function ActionButton({
  title,
  onClick,
  icon,
  variant = "primary",
  disabled = false,
  className = "",
  type = "button",
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children" | "onClick"> & {
  title: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  icon?: WebIconName;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      {...buttonProps}
      type={type}
      className={`tw-button tw-button--${variant} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {icon ? <Icon name={icon} size={18} /> : null}
      <span>{title}</span>
    </button>
  );
}

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange" | "maxLength"> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  maxLength?: number;
  hint?: string;
};

export function Field({ label, value, onValueChange, hint, maxLength, className = "", ...inputProps }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="tw-field">
      <label className="tw-field__label" htmlFor={id}>{label}</label>
      <input
        {...inputProps}
        id={id}
        className={`tw-input ${className}`.trim()}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        aria-describedby={hintId}
        dir={inputProps.dir ?? "auto"}
      />
      {hint ? <small id={hintId} className="tw-field__hint">{hint}</small> : null}
    </div>
  );
}

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "value" | "onChange" | "maxLength"> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  maxLength?: number;
};

export function TextAreaField({ label, value, onValueChange, maxLength, className = "", ...inputProps }: TextAreaProps) {
  const id = useId();
  return (
    <div className="tw-field">
      <label className="tw-field__label" htmlFor={id}>{label}</label>
      <textarea
        {...inputProps}
        id={id}
        className={`tw-input tw-textarea ${className}`.trim()}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onValueChange(event.currentTarget.value)}
      />
    </div>
  );
}

export function ScreenHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <header className="tw-screen-heading">
      {eyebrow ? <p className="tw-eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {subtitle ? <p className="tw-subtitle">{subtitle}</p> : null}
    </header>
  );
}

export function InlineNotice({ children, tone = "info", className = "" }: { children: ReactNode; tone?: "info" | "warning" | "success"; className?: string }) {
  return (
    <div className={`tw-notice tw-notice--${tone} ${className}`.trim()} role="note">
      <Icon name={tone === "warning" ? "warning-outline" : tone === "success" ? "checkmark-circle-outline" : "information-circle-outline"} size={19} />
      <div>{children}</div>
    </div>
  );
}
