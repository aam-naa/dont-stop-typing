import { THEMES, setTheme, useTheme } from "../hooks/useTheme";

const ThemeSwitcher = () => {
  const active = useTheme();

  return (
    <div className="themes">
      <span className="themes-label" aria-hidden="true">
        theme
      </span>
      {THEMES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className="theme-btn"
          aria-pressed={active === value}
          onClick={() => setTheme(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
