import Select, { components } from 'react-select';

export const CustomValueContainer = ({ children, ...props }) => {
  const hasValue = props.hasValue && props.getValue().length > 0;
  const isMenuOpen = props.selectProps.menuIsOpen;

  return (
    <components.ValueContainer {...props}>
      {/* Si tiene filtro aplicado y el menú está cerrado, forzamos la aparición del placeholder */}
      {hasValue && !isMenuOpen && (
        <components.Placeholder {...props} isFocused={false}>
          {props.selectProps.placeholder}
        </components.Placeholder>
      )}
      {children}
    </components.ValueContainer>
  );
};