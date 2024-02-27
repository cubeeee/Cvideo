import { SettingOutlined } from '@ant-design/icons'
import { Button, Drawer, DrawerProps, Radio, RadioChangeEvent, Space } from 'antd';
import { useState } from 'react';

const DrawerSetting = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [placement, setPlacement] = useState<DrawerProps['placement']>('left');

  const showDrawer = () => {
    setOpenDrawer(true);
  };

  const onClose = () => {
    setOpenDrawer(false);
  };

  return (
    <>
      <div className='drawer_wapper' onClick={() => setOpenDrawer(!openDrawer)}><SettingOutlined /></div>
      <Drawer
        title="Basic Drawer"
        placement={'left'}
        closable={false}
        onClose={onClose}
        open={openDrawer}
        key={placement}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  )
};

export default DrawerSetting