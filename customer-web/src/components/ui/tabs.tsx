import styled from "styled-components";

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
const Item = styled.button<{ $active: boolean }>`
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? "#fff3ec" : theme.colors.white};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.navy)};
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  @media (max-width: 899px) {
    min-height: 32px;
    padding: 0 12px;
    font-size: 0.8rem;
  }
`;

export function Tabs({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Row>
      {options.map((option) => (
        <Item
          key={option}
          $active={option === value}
          onClick={() => onChange(option)}
        >
          {option}
        </Item>
      ))}
    </Row>
  );
}
