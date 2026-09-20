'use client';

import React from 'react';
import { Room101SmartMartScene, Room101SmartMartSceneProps } from './Room101SmartMartScene';

export type SmartMartStoreProps = Room101SmartMartSceneProps;

export const SmartMartStore: React.FC<SmartMartStoreProps> = (props) => {
  return <Room101SmartMartScene {...props} />;
};

export default SmartMartStore;
