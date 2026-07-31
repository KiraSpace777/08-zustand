// ==========================================================
// SearchBox
// ==========================================================
//
import css from "./SearchBox.module.css";

interface SearchBoxProps {
  onSearchChange: (text: string) => void;
}

export default function SearchBox({ onSearchChange }: SearchBoxProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onSearchChange(event.target.value);
  };

  return (
    <input
      type="text"
      onChange={handleChange}
      className={css.input}
      placeholder="Search notes"
      // autoFocus
    />
  );
}
