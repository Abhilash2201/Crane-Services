import styled from "styled-components";

const Row = styled.div`display: flex; flex-wrap: wrap; gap: 8px;`;
const Item = styled.button<{ $active: boolean }>`
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? "#fff3ec" : theme.colors.white)};
  color: ${({ theme }) => theme.colors.navy}; min-height: 42px; padding: 0 14px; border-radius: 999px; font-weight: 600; cursor: pointer;
`;

export function Tabs({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void; }) {
  return <Row>{options.map((option) => <Item key={option} $active={option === value} onClick={() => onChange(option)}>{option}</Item>)}</Row>;
}
