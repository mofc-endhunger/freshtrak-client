// Mock for @radix-ui/react-use-size to avoid ResizeObserver issues
export const useSize = jest.fn(() => ({
  width: 0,
  height: 0,
}));
