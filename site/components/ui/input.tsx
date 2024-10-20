import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, readOnly, onChange, value, ...props }, ref) => {
    const isNumberType = type === 'number';
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = React.useState(value || '0');

    React.useEffect(() => {
      setInternalValue(value || '0');
    }, [value]);

    const handleIncrement = () => {
      if (inputRef.current) {
        const currentValue = parseFloat(internalValue) || 0;
        const step = parseFloat(inputRef.current.step) || 1;
        const newValue = currentValue + step;
        updateValue(newValue);
      }
    };

    const handleDecrement = () => {
      if (inputRef.current) {
        const currentValue = parseFloat(internalValue) || 0;
        const step = parseFloat(inputRef.current.step) || 1;
        let newValue;
        if (currentValue <= 1) {
          newValue = 0;
        } else {
          newValue = Math.max(0, currentValue - step);
        }
        updateValue(newValue);
      }
    };

    const updateValue = (newValue: number) => {
      const stringValue = newValue.toString();
      setInternalValue(stringValue);
      if (inputRef.current) {
        inputRef.current.value = stringValue;
        const event = new Event('input', { bubbles: true });
        inputRef.current.dispatchEvent(event);
        
        if (onChange) {
          onChange({ target: { value: stringValue } } as React.ChangeEvent<HTMLInputElement>);
        }
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
      if (newValue === '' || isNaN(parseFloat(newValue))) {
        newValue = '0';
      } else {
        newValue = Math.max(0, parseFloat(newValue)).toString();
      }
      setInternalValue(newValue);
      if (onChange) {
        onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    React.useImperativeHandle(ref, () => inputRef.current!);

    const isDecrementDisabled = parseFloat(internalValue) === 0;

    return (
      <div className={cn(
        "relative group",
        isNumberType && !readOnly && "custom-number-input-wrapper"
      )}>
        <input
          type={type}
          readOnly={readOnly}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            isNumberType && "custom-number-input",
            className
          )}
          ref={inputRef}
          onChange={handleInputChange}
          value={internalValue}
          {...props}
        />
        {isNumberType && !readOnly && (
          <div className="absolute right-0 top-0 bottom-0 w-6 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 flex items-center justify-center"
              onClick={handleIncrement}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14l5-5 5 5z"/>
              </svg>
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 bg-neutral-700 text-neutral-200 flex items-center justify-center",
                isDecrementDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-600"
              )}
              onClick={handleDecrement}
              disabled={isDecrementDisabled}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

// The style block remains the same as in the previous version
const style = `
  .custom-number-input-wrapper {
    padding-right: 1.5rem;
  }
  .custom-number-input::-webkit-outer-spin-button,
  .custom-number-input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
    display: none !important;
  }
  .custom-number-input[type=number] {
    -moz-appearance: textfield !important;
  }
  .custom-number-input {
    -moz-appearance: textfield !important;
  }
  .custom-number-input::-ms-clear,
  .custom-number-input::-ms-reveal {
    display: none !important;
  }
  .custom-number-input::-webkit-inner-spin-button, 
  .custom-number-input::-webkit-outer-spin-button { 
    appearance: none !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
  }
`

// Add this line to inject the styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.innerHTML = style
  document.head.appendChild(styleElement)
}