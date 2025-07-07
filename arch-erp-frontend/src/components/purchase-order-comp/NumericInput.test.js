import { render, screen, fireEvent } from '@testing-library/react';
import NumericInput from './NumericInput';

describe('NumericInput Component', () => {
  test('renders without crashing', () => {
    render(<NumericInput length={[10, 3]} />);
    const inputElement = screen.getByPlaceholderText(/Enter number/i);
    expect(inputElement).toBeInTheDocument();
  });

  test('accepts valid numeric input', () => {
    render(<NumericInput length={[10, 3]} />);
    const inputElement = screen.getByPlaceholderText(/Enter number/i);
    
    fireEvent.change(inputElement, { target: { value: '123.45' } });
    expect(inputElement.value).toBe('123.45');
  });

  test('does not accept multiple decimal points', () => {
    render(<NumericInput length={[10, 3]} />);
    const inputElement = screen.getByPlaceholderText(/Enter number/i);
    
    fireEvent.change(inputElement, { target: { value: '123.45.67' } });
    expect(inputElement.value).toBe('123.45'); // Assuming the last valid input is kept
  });

  test('does not accept leading zeros', () => {
    render(<NumericInput length={[10, 3]} />);
    const inputElement = screen.getByPlaceholderText(/Enter number/i);
    
    fireEvent.change(inputElement, { target: { value: '0123' } });
    expect(inputElement.value).toBe('123'); // Assuming leading zero is removed
  });

  test('allows negative sign only at the start', () => {
    render(<NumericInput length={[10, 3]} />);
    const inputElement = screen.getByPlaceholderText(/Enter number/i);
    
    fireEvent.change(inputElement, { target: { value: '-123' } });
    expect(inputElement.value).toBe('-123');
    
    fireEvent.change(inputElement, { target: { value: '1-23' } });
    expect(inputElement.value).toBe('1'); // Assuming invalid input is discarded
  });

  test('validates input on blur', () => {
    render(<NumericInput length={[10, 3]} />);
    const inputElement = screen.getByPlaceholderText(/Enter number/i);
    
    fireEvent.change(inputElement, { target: { value: '' } });
    fireEvent.blur(inputElement);
    expect(inputElement.value).toBe(''); // Assuming empty input is not allowed
  });
});