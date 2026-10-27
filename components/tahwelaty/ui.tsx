import type { ComponentProps, ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

export const palette = {
  background: "#06101B",
  surface: "#0B1A28",
  card: "#0F2030",
  cardRaised: "#142A3D",
  border: "#1E3548",
  text: "#F5F7FA",
  muted: "#9BAEBE",
  subtle: "#6D8496",
  gold: "#DCC477",
  goldDeep: "#A98C48",
  teal: "#57D2AF",
  blue: "#84B7F0",
  red: "#F18C83",
  white: "#FFFFFF",
};

export type IconName = ComponentProps<typeof Ionicons>["name"];

export function Icon({ name, color = palette.muted, size = 20 }: { name: IconName; color?: string; size?: number }) {
  return <Ionicons name={name} color={color} size={size} accessible={false} />;
}

export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function Pill({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "teal" | "muted" | "red" }) {
  const color = tone === "teal" ? palette.teal : tone === "red" ? palette.red : tone === "muted" ? palette.muted : palette.gold;
  const backgroundColor = tone === "teal" ? "#10342F" : tone === "red" ? "#3A2428" : tone === "muted" ? "#172838" : "#332F21";
  return (
    <View style={[styles.pill, { backgroundColor, borderColor: `${color}55` }]}>
      <Text style={[styles.pillText, { color }]}>{children}</Text>
    </View>
  );
}

export function ActionButton({
  title,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
  accessibilityLabel,
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const buttonStyle = variant === "primary" ? styles.primaryButton : variant === "danger" ? styles.dangerButton : variant === "quiet" ? styles.quietButton : styles.secondaryButton;
  const textColor = variant === "primary" ? palette.background : variant === "danger" ? palette.red : variant === "quiet" ? palette.gold : palette.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, buttonStyle, pressed && !disabled ? styles.pressed : null, disabled ? styles.disabled : null, style]}
    >
      {icon ? <Icon name={icon} size={18} color={textColor} /> : null}
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  maxLength,
  accessibilityLabel,
  autoCapitalize = "none",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: TextInputProps["keyboardType"];
  secureTextEntry?: boolean;
  maxLength?: number;
  accessibilityLabel?: string;
  autoCapitalize?: TextInputProps["autoCapitalize"];
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.subtle}
        secureTextEntry={secureTextEntry}
        selectionColor={palette.gold}
        style={styles.input}
        textAlign="right"
        value={value}
      />
    </View>
  );
}

export function ScreenHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.headingWrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text accessibilityRole="header" style={styles.heading}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function InlineNotice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" | "success" }) {
  const color = tone === "warning" ? palette.gold : tone === "success" ? palette.teal : palette.blue;
  const background = tone === "warning" ? "#2A281E" : tone === "success" ? "#102D2A" : "#142538";
  const icon: IconName = tone === "warning" ? "warning-outline" : tone === "success" ? "checkmark-circle-outline" : "information-circle-outline";
  return (
    <View accessibilityRole="summary" style={[styles.notice, { borderColor: `${color}55`, backgroundColor: background }]}>
      <Icon name={icon} color={color} size={18} />
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  pill: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 11, fontWeight: "800" },
  button: { minHeight: 48, borderRadius: 15, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  primaryButton: { backgroundColor: palette.gold },
  secondaryButton: { backgroundColor: palette.cardRaised, borderWidth: 1, borderColor: palette.border },
  quietButton: { backgroundColor: "#302C20", borderWidth: 1, borderColor: "#54482B" },
  dangerButton: { backgroundColor: "#311F25", borderWidth: 1, borderColor: "#684149" },
  buttonText: { fontSize: 14, fontWeight: "800", textAlign: "center" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  fieldWrap: { gap: 7 },
  fieldLabel: { color: palette.muted, fontSize: 12, fontWeight: "700", textAlign: "right" },
  input: { minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, color: palette.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  headingWrap: { gap: 5, marginBottom: 3 },
  eyebrow: { color: palette.gold, fontSize: 11, fontWeight: "800", textAlign: "right", letterSpacing: 0.3 },
  heading: { color: palette.text, fontSize: 23, fontWeight: "900", textAlign: "right" },
  subtitle: { color: palette.muted, fontSize: 13, lineHeight: 21, textAlign: "right" },
  notice: { borderWidth: 1, borderRadius: 15, padding: 12, flexDirection: "row-reverse", alignItems: "flex-start", gap: 8 },
  noticeText: { color: palette.muted, flex: 1, fontSize: 12, lineHeight: 19, textAlign: "right" },
});

export const uiStyles = styles;
