import type { Meta, StoryObj } from '@storybook/react';

import { DisplayMode } from '../../types/enums/displayMode';

import { PostEditor } from '../../components/PostEditor';

import photo from './../../../public/images/temp/photos/photo5.jpg';

const meta = {
  title: 'Example/PostEditor',
  component: PostEditor,
  tags: ['autodocs'],
  argTypes: {
  },
} satisfies Meta<typeof PostEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoAttachmentsItems: Story = {
  args: {
    displayMode: DisplayMode.Normal,
    translations: {},
    peerProfile: {id: "123", profileId: "456", firstName: "John", lastName: "Smith", gender: 1, dateOfBirth: "", userAccountId: "", createdBy: "", createdTimestamp: "", lastModifiedBy: "", lastModifiedTimestamp: "", coverPicturesCollection: undefined },
    hardBorders: true,
    onPostCallback: undefined
  }
};
