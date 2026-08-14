import GridBackground from './components/GridBackground'
import HeroCutout from './components/HeroCutout'
import LinkList from './components/LinkList'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <GridBackground />
      <main className="bio-main">
        <div className="bio-container">
          <HeroCutout />
          <LinkList />
          <Footer />
        </div>
      </main>
    </>
  )
}
