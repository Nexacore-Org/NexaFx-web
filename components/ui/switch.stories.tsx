import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Switch } from './switch'

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  args: {},
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

export const Unchecked: Story = {
  args: {
    defaultChecked: false,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    defaultChecked: true,
    disabled: true,
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="notifications" />
      <label htmlFor="notifications" className="text-sm font-medium">
        Enable notifications
      </label>
    </div>
  ),
}

export const WithLabelChecked: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="dark-mode" defaultChecked />
      <label htmlFor="dark-mode" className="text-sm font-medium">
        Dark mode
      </label>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Switch size="sm" />
        <span className="text-xs">Small</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch size="default" />
        <span className="text-sm">Default</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch size="lg" />
        <span className="text-base">Large</span>
      </div>
    </div>
  ),
}

export const MultipleSwitches: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch id="switch1" defaultChecked />
        <label htmlFor="switch1" className="text-sm">
          Email notifications
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch2" />
        <label htmlFor="switch2" className="text-sm">
          Push notifications
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch3" disabled />
        <label htmlFor="switch3" className="text-sm text-muted-foreground">
          SMS notifications (disabled)
        </label>
      </div>
    </div>
  ),
}
