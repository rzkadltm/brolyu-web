type SearchInputProps = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="ap-search-wrap">
      <span className="text-[14px]" style={{ color: 'var(--text-d)' }}>🔍</span>
      <input
        className="ap-search-input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

export default SearchInput
