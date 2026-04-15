import type { DetailedHTMLProps, HTMLAttributes } from "react";

export {};

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
      "md-filled-button": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          disabled?: boolean;
          href?: string;
          target?: string;
          type?: "button" | "submit" | "reset";
          trailingIcon?: boolean;
        },
        HTMLElement
      >;
      "md-outlined-button": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          disabled?: boolean;
          href?: string;
          type?: "button" | "submit" | "reset";
        },
        HTMLElement
      >;
      "md-text-button": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          disabled?: boolean;
          href?: string;
          type?: "button" | "submit" | "reset";
          trailingIcon?: boolean;
        },
        HTMLElement
      >;
      "md-elevated-button": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          disabled?: boolean;
        },
        HTMLElement
      >;
      "md-icon": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-icon-button": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          disabled?: boolean;
          toggle?: boolean;
          selected?: boolean;
        },
        HTMLElement
      >;
      "md-outlined-text-field": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          label?: string;
          value?: string;
          type?: string;
          required?: boolean;
          disabled?: boolean;
          error?: boolean;
          "error-text"?: string;
          "supporting-text"?: string;
          placeholder?: string;
          maxlength?: number;
          rows?: number;
          cols?: number;
        },
        HTMLElement
      >;
      "md-filled-text-field": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          label?: string;
          value?: string;
          type?: string;
          required?: boolean;
          disabled?: boolean;
          error?: boolean;
          "error-text"?: string;
        },
        HTMLElement
      >;
      "md-checkbox": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          checked?: boolean;
          disabled?: boolean;
          indeterminate?: boolean;
        },
        HTMLElement
      >;
      "md-radio": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          checked?: boolean;
          disabled?: boolean;
          name?: string;
          value?: string;
        },
        HTMLElement
      >;
      "md-switch": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          selected?: boolean;
          disabled?: boolean;
          icons?: boolean;
        },
        HTMLElement
      >;
      "md-dialog": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          open?: boolean;
          quick?: boolean;
          returnValue?: string;
        },
        HTMLElement
      >;
      "md-divider": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-fab": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          label?: string;
          size?: "small" | "medium" | "large";
          variant?: "surface" | "primary" | "secondary" | "tertiary";
        },
        HTMLElement
      >;
      "md-list": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-list-item": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          headline?: string;
          "supporting-text"?: string;
          disabled?: boolean;
          type?: "text" | "button" | "link";
          href?: string;
        },
        HTMLElement
      >;
      "md-menu": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          open?: boolean;
          anchor?: string;
          positioning?: string;
        },
        HTMLElement
      >;
      "md-menu-item": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          headline?: string;
          disabled?: boolean;
        },
        HTMLElement
      >;
      "md-outlined-select": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          label?: string;
          value?: string;
          required?: boolean;
          disabled?: boolean;
          error?: boolean;
          "error-text"?: string;
          "supporting-text"?: string;
        },
        HTMLElement
      >;
      "md-select-option": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          value?: string;
          headline?: string;
          selected?: boolean;
          disabled?: boolean;
        },
        HTMLElement
      >;
      "md-slider": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          min?: number;
          max?: number;
          value?: number;
          step?: number;
          labeled?: boolean;
          disabled?: boolean;
        },
        HTMLElement
      >;
      "md-linear-progress": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          indeterminate?: boolean;
          value?: number;
          max?: number;
          buffer?: number;
        },
        HTMLElement
      >;
      "md-circular-progress": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          indeterminate?: boolean;
          value?: number;
        },
        HTMLElement
      >;
      "md-tabs": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-primary-tab": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          active?: boolean;
        },
        HTMLElement
      >;
      "md-secondary-tab": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          active?: boolean;
        },
        HTMLElement
      >;
      "md-chip-set": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-filter-chip": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          label?: string;
          selected?: boolean;
          disabled?: boolean;
        },
        HTMLElement
      >;
      "md-input-chip": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          label?: string;
          disabled?: boolean;
        },
        HTMLElement
      >;
      "md-ripple": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-elevated-card": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "md-filled-card": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-outlined-card": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "md-navigation-drawer": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          opened?: boolean;
        },
        HTMLElement
      >;
      "md-badge": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          value?: string;
        },
        HTMLElement
      >;
      "md-outlined-segmented-button": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          label?: string;
          selected?: boolean;
          disabled?: boolean;
          noCheckmark?: boolean;
        },
        HTMLElement
      >;
      "md-outlined-segmented-button-set": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          multiselect?: boolean;
        },
        HTMLElement
      >;
      }
    }
  }
}
