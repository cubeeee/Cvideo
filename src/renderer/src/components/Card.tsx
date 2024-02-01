import { Button, Form, Input, Modal, message } from "antd";
import { useState } from "react";
import { FaFolderOpen } from "react-icons/fa";

const CardContent = () => {
  const [pathVideos, setPathVideos] = useState<string[]>([])
  const [visible, setVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [form] = Form.useForm()
  const initialValues = {}
  const handleOpenDirDialog = () => {
    if (pathVideos?.length > 0) {
      return
    }
    window.api.openFileDialog().then((res: any) => {
      setPathVideos(res)
    })
  }
  const handleOpenFolderDialog = () => {
    window.api.openFolderDialog().then((res: any) => {
      form.setFieldsValue({ folderPath: res })
    })
  }

  const handleCutVideo = () => {
    setVisible(true)
  }

  const onSubmit = async (values: {
    folderPath?: string
    folderName?: string,
    cutTime?: number
  }) => {
    setLoading(true)
    try {
      await window.api.cutVideo(pathVideos, values.folderPath as string, values.folderName, values.cutTime)
      message.success('Đã cắt xong video');
    } catch (error) {
      console.log(error);
      message.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className='content_box'
        onClick={handleOpenDirDialog}
      >
        <span className='content_icon'><FaFolderOpen /></span>
        <h1 className='content_title'>Chọn folder chứa video...</h1>
        {
          pathVideos?.length > 0 && (
            <p className=''>Đã chọn {pathVideos?.length} video</p>
          )
        }
        {
          pathVideos?.length > 0 && (
            <>
              <div className='content_button_wrapper'>
                <Button type='primary' danger onClick={() => setPathVideos([])}>Hủy</Button>
                <Button type='primary' onClick={handleCutVideo}>Chạy</Button>
              </div>
            </>
          )
        }
      </div>
      <Modal
        title={`Settings`}
        open={visible}
        onCancel={() => setVisible(false)}
        destroyOnClose
        onOk={form.submit}
        // okButtonProps={{ loading }}
        width={450}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout='vertical'
          initialValues={initialValues}
          onFinish={onSubmit}
        >
          <Form.Item
            label='Chọn folder chứa video'
            name='folderPath'
          >
            <Input onClick={handleOpenFolderDialog} />
          </Form.Item>
          <Form.Item
            label='Chọn tên folder'
            name='folderName'
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='Nhập Số phút'
            name='cutTime'
            // check value is number
            rules={[
            {
              pattern: /^[0-9]*$/,
              message: 'Vui lòng nhập số'
            }
            ]}
            tooltip='Nhập số phút cần chia nhỏ trong video, mặc định là 60 phút'
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CardContent;