import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('sollte Text rendern', () => {
    render(<Button>Klick mich</Button>);
    expect(screen.getByText('Klick mich')).toBeDefined();
  });

  it('sollte disabled sein wenn prop gesetzt', () => {
    render(<Button disabled>Test</Button>);
    expect(screen.getByText('Test').closest('button')?.disabled).toBe(true);
  });
});
