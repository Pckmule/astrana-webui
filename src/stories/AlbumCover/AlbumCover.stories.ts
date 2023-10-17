import type { Meta, StoryObj } from '@storybook/react';

import { DisplayMode } from '../../types/enums/displayMode';
import { MediaType } from '../../types/enums/mediaType';
import { UploadStatus } from '../../types/enums/uploadStatus';

import { IAlbumItem } from '../../types/interfaces/albumItem';

import { AlbumCover } from '../../components/AlbumCover';

import photo1 from './../../../public/images/temp/photos/photo1.jpg';
import photo2 from './../../../public/images/temp/photos/photo2.jpg';
import photo3 from './../../../public/images/temp/photos/photo3.jpg';
import photo4 from './../../../public/images/temp/photos/photo4.jpg';
import photo5 from './../../../public/images/temp/photos/photo5.jpg';

const meta = {
  title: 'Example/AlbumCover',
  component: AlbumCover,
  tags: ['autodocs'],
  argTypes: {
  },
} satisfies Meta<typeof AlbumCover>;

export default meta;
type Story = StoryObj<typeof meta>;

const item1:IAlbumItem = {
  correlationId: "1",
  mediaType: MediaType.Image,
  uploadStatus: UploadStatus.Uploaded,
  referenceId: undefined, 
  url: photo1,
  fileData: new File([], "file1"), 
  fileSizeBytes: 0,
  width: 300,
  height: 150
};

const item2:IAlbumItem = {
  correlationId: "2",
  mediaType: MediaType.Image,
  uploadStatus: UploadStatus.Uploaded,
  referenceId: undefined, 
  url: photo2,
  fileData: new File([], "file2"), 
  fileSizeBytes: 0,
  width: 300,
  height: 150
};

const item3:IAlbumItem = {
  correlationId: "3",
  mediaType: MediaType.Image,
  uploadStatus: UploadStatus.Uploaded,
  referenceId: undefined, 
  url: photo3,
  fileData: new File([], "file3"), 
  fileSizeBytes: 0,
  width: 300,
  height: 150
};

const item4:IAlbumItem = {
  correlationId: "4",
  mediaType: MediaType.Image,
  uploadStatus: UploadStatus.Uploaded,
  referenceId: undefined, 
  url: photo4,
  fileData: new File([], "file4"), 
  fileSizeBytes: 0,
  width: 300,
  height: 150
};

const item5:IAlbumItem = {
  correlationId: "5",
  mediaType: MediaType.Image,
  uploadStatus: UploadStatus.Uploaded,
  referenceId: undefined, 
  url: photo5,
  fileData: new File([], "file5"), 
  fileSizeBytes: 0,
  width: 300,
  height: 150
};

export const OneItem: Story = {
  args: {
    displayMode: DisplayMode.Normal,
    maxWidth: 600,
    maxWidthUnit: "px",
    maxHeight: 600,
    mediaItems: [item1]
  }
};

export const TwoItems: Story = {
  args: {
    displayMode: DisplayMode.Normal,
    maxWidth: 600,
    maxWidthUnit: "px",
    maxHeight: 600,
    mediaItems: [item1, item2]
  }
};

export const ThreeItems: Story = {
  args: {
    displayMode: DisplayMode.Normal,
    maxWidth: 600,
    maxWidthUnit: "px",
    maxHeight: 600,
    mediaItems: [item1, item2, item3]
  }
};

export const FourItems: Story = {
  args: {
    displayMode: DisplayMode.Normal,
    maxWidth: 600,
    maxWidthUnit: "px",
    maxHeight: 600,
    mediaItems: [item1, item2, item3, item4]
  }
};

export const FiveItems: Story = {
  args: {
    displayMode: DisplayMode.Normal,
    maxWidth: 600,
    maxWidthUnit: "px",
    maxHeight: 600,
    mediaItems: [item1, item2, item3, item4, item5]
  }
};
