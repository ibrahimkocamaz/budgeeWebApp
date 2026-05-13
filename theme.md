# Budgee Web App - Design System & Theme

## 1. Brand Assets
Located in `src/budgee_icons/`
*   **Logo**: `budgee_logo.png`
*   **Icon**: `budgee_icon.png`
*   **Reference Screen**: `1.png`

## 2. Color Palette (Confirmed)

### Core Colors
*   **Primary (Card/Surface)**: `#1A1F26` (Mapped from `primary`)
*   **App Background**: `#12151A` (Mapped from `appBackground`)
*   **Secondary (Green)**: `#0aac35`
*   **Secondary Red**: `#a82319`

### Text Colors
*   **White Text**: `#ffffff`
*   **Dark Text**: `#000000`
*   **Income Text**: `#00E676`
*   **Expense Text**: `#F44336`

### Functional
*   **Divider**: `#2A2F37`
*   **Input Border**: `#252B33`
*   **Cancel Button**: `#E53935`
*   **Disabled**: `#757575`
*   **Placeholder**: `#9e9e9e`

### Status
*   **Error**: `#cf6679`
*   **Success**: `#4CAF50`
*   **Warning**: `#ffab00`
*   **Info**: `#2196f3`

## 3. CSS Variables Mapping
We will use these names in the CSS:
```css
:root {
  --bg-app: #12151A;
  --bg-card: #1A1F26;
  
  --color-primary: #0aac35; /* Using secondary green as the main 'brand' action color? Or keep Primary as the dark surface? */
  /* Decision: 'primary' in existing code seems to be a surface color, but usually primary is a brand color. 
     I will map --bg-surface to provided 'primary' (#1A1F26) and --color-brand to 'secondary' (#0aac35) for buttons etc. 
  */
  --color-secondary-red: #a82319;

  --text-main: #ffffff;
  --text-muted: #9e9e9e; /* Placeholder/Disabled */
  
  --text-income: #00E676;
  --text-expense: #F44336;

  --border-color: #252B33;
  --divider-color: #2A2F37;
}
```
