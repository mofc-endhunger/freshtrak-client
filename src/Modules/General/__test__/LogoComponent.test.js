import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LogoComponent from '../LogoComponent';

describe('LogoComponent', () => {
  test('renders logo image', () => {
    render(
      <MemoryRouter>
        <LogoComponent />
      </MemoryRouter>,
    );
    const logoImage = screen.getByAltText('Freshtrak Logo');
    expect(logoImage).toBeInTheDocument();
  });

  test('renders with correct image source', () => {
    render(
      <MemoryRouter>
        <LogoComponent />
      </MemoryRouter>,
    );
    const logoImage = screen.getByAltText('Freshtrak Logo');
    expect(logoImage).toHaveAttribute('src');
  });

  test('renders with correct CSS classes', () => {
    render(
      <MemoryRouter>
        <LogoComponent />
      </MemoryRouter>,
    );
    const container = screen.getByAltText('Freshtrak Logo').closest('div')
      .parentElement.parentElement;
    expect(container).toHaveClass('w-full', 'lg:w-1/2', 'xl:w-1/2');
  });

  test('logo image has correct styling classes', () => {
    render(
      <MemoryRouter>
        <LogoComponent />
      </MemoryRouter>,
    );
    const logoImage = screen.getByAltText('Freshtrak Logo');
    expect(logoImage).toHaveClass('max-w-full', 'max-h-full');
  });

  test('logo container has correct height', () => {
    render(
      <MemoryRouter>
        <LogoComponent />
      </MemoryRouter>,
    );
    const logoContainer = screen.getByAltText('Freshtrak Logo').parentElement;
    expect(logoContainer).toHaveClass('h-10');
  });
});
