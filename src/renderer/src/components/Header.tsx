import { FaRegWindowClose, FaRegWindowMaximize, FaRegWindowMinimize } from "react-icons/fa";


const Header = () => {
  const handleCloseWindow = () => {
    window.api.closeApp()
  }
  const handleMinimizeWindow = () => {
    window.api.minimizeApp()
  }
  const handleMaximizeWindow = () => {
    window.api.maximizeApp()
  }
  return (
    <>
      <div className="header-wapper">
        <div className='mark_header-drag'></div>
        <div className="header_item">
          <span className="header_item_icon" onClick={handleMinimizeWindow}>
            <FaRegWindowMinimize />
          </span>
          <span className="header_item_icon" onClick={handleMaximizeWindow}>
            <FaRegWindowMaximize />
          </span>
          <span className="header_item_icon" onClick={handleCloseWindow}>
            <FaRegWindowClose />
          </span>
        </div>
      </div>
    </>
  );
};

export default Header;