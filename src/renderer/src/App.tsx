
import Icon from './assets/360_F_311854791_7xNmOhj2JHJfdhJdshkTOdnjR3mPMvBK.jpg'
import Header from './components/Header'
import CardContent from './components/Card'

function App(): JSX.Element {


  return (
    <>
      <div className="main">
        <Header />
        <div className="content_wrapper"
          style={{
            backgroundImage: `url(${Icon})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
         <CardContent />
        </div>
      </div>
    </>
  )
}

export default App
