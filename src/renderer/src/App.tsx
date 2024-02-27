
import { useEffect } from 'react'
import Icon from './assets/1338277.png'
import CardContent from './components/Card'
import DrawerSetting from './components/DrawerSetting'

function App(): JSX.Element {
  useEffect(() => {
    window.api.checkResource()
  }, [])
  return (
    <>
      <div className="main">
        {/* <Header /> */}
        <div className="content_wrapper"
          style={{
            backgroundImage: `url(${Icon})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
         <CardContent />
        </div>
        <DrawerSetting />
      </div>
    </>
  )
}

export default App
