import type React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('renders the hero heading and subtitle', async () => {
    // Home is an async server component; render returns a Promise
    const ui = await Home();
    render(ui as unknown as React.ReactElement);
    expect(screen.getByText('Group and Embed Your OpenAI Assistants')).toBeInTheDocument();
    expect(
      screen.getByText('Create groups of assistants and embed them on your website with a simple script tag.')
    ).toBeInTheDocument();
  });

  it('shows Sign In and Sign Up buttons', async () => {
    const ui = await Home();
    render(ui as unknown as React.ReactElement);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });
});
