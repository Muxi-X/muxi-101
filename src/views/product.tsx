'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import iconXiazi from '@/image/product/xiaziIcon.svg'
import iconCixing from '@/image/product/cixingIcon.svg'
import iconKezhan from '@/image/product/kezhanIcon.svg'
import iconXuexitong from '@/image/product/xuexitongIcon.svg'
import xiaziScreen111 from '@/image/product/xiazi/111.jpg'
import xiaziScreen222 from '@/image/product/xiazi/222.jpg'
import xiaziScreen333 from '@/image/product/xiazi/333.jpg'
import xiaziScreen444 from '@/image/product/xiazi/444.jpg'
import xiaziScreen555 from '@/image/product/xiazi/555.jpg'
import cixingScreen1 from '@/image/product/cixing/1.png'
import cixingScreen2 from '@/image/product/cixing/2.png'
import cixingScreen3 from '@/image/product/cixing/3.png'
import cixingScreen4 from '@/image/product/cixing/4.png'
import cixingScreen5 from '@/image/product/cixing/5.png'
import kezhanScreen1 from '@/image/product/kezhan/1.png'
import kezhanScreen2 from '@/image/product/kezhan/2.png'
import kezhanScreen3 from '@/image/product/kezhan/3.png'
import kezhanScreen4 from '@/image/product/kezhan/4.png'
import kezhanScreen5 from '@/image/product/kezhan/5.png'
import xiaolingtongScreen1 from '@/image/product/xiaolingtong/1.png'
import xiaolingtongScreen2 from '@/image/product/xiaolingtong/2.png'
import xiaolingtongScreen3 from '@/image/product/xiaolingtong/3.png'
import xiaolingtongScreen4 from '@/image/product/xiaolingtong/4.png'
import xiaolingtongScreen5 from '@/image/product/xiaolingtong/5.png'
import iphonePro from '@/image/iphonepro.svg'
import point from '@/image/point.svg'
import ProductRipple from './product-ripple'
import './product.scss'

const apps = [
  { src: iconXiazi, title: '华师匣子' },
  { src: iconCixing, title: '此行' },
  { src: iconKezhan, title: '木犀课栈' },
  { src: iconXuexitong, title: '校灵通' },
]

const xiaziScreens = [
  {
    src: xiaziScreen111,
    name: '111',
    left: -9.83,
    top: 79.94,
    width: 150.15,
    height: 326.06,
    rotation: -20.55,
    layer: 1,
    delay: 0.16,
  },
  {
    src: xiaziScreen222,
    name: '222',
    left: 103.24,
    top: 37.47,
    width: 168.58,
    height: 366.25,
    rotation: -10.81,
    layer: 2,
    delay: 0.08,
  },
  {
    src: xiaziScreen333,
    name: '333',
    left: 254.67,
    top: 0,
    width: 201.4,
    height: 438,
    rotation: 0,
    layer: 5,
    delay: 0,
  },
  {
    src: xiaziScreen444,
    name: '444',
    left: 438.92,
    top: 37.47,
    width: 168.58,
    height: 366.25,
    rotation: 10.81,
    layer: 2,
    delay: 0.08,
  },
  {
    src: xiaziScreen555,
    name: '555',
    left: 570.42,
    top: 79.94,
    width: 150.15,
    height: 326.06,
    rotation: 20.55,
    layer: 1,
    delay: 0.16,
  },
]

const cixingScreenImages = [
  cixingScreen1,
  cixingScreen2,
  cixingScreen3,
  cixingScreen4,
  cixingScreen5,
]

const cixingScreens = xiaziScreens.map((screen, index) => ({
  ...screen,
  src: cixingScreenImages[index],
  name: String(index + 1),
}))

const kezhanScreenImages = [
  kezhanScreen1,
  kezhanScreen2,
  kezhanScreen3,
  kezhanScreen4,
  kezhanScreen5,
]

const kezhanScreens = xiaziScreens.map((screen, index) => ({
  ...screen,
  src: kezhanScreenImages[index],
  name: String(index + 1),
}))

const xiaolingtongScreenImages = [
  xiaolingtongScreen1,
  xiaolingtongScreen2,
  xiaolingtongScreen3,
  xiaolingtongScreen4,
  xiaolingtongScreen5,
]

const xiaolingtongScreens = xiaziScreens.map((screen, index) => ({
  ...screen,
  src: xiaolingtongScreenImages[index],
  name: String(index + 1),
}))

export default function ProductIntro() {
  const stageRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLImageElement>(null)
  const [pointer, setPointer] = useState({ x: 0, y: 0, visible: false, pressed: false })
  const [glow, setGlow] = useState({ x: 50, y: 50, visible: false })
  const [isVisible, setIsVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const selectedScreens =
    selectedProduct === '华师匣子'
      ? xiaziScreens
      : selectedProduct === '此行'
        ? cixingScreens
        : selectedProduct === '木犀课栈'
          ? kezhanScreens
          : selectedProduct === '校灵通'
            ? xiaolingtongScreens
            : null

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      root: stage.closest('.home'),
      threshold: 0.25,
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const isInsideScreen = (event: PointerEvent<HTMLDivElement>) => {
    const screen = screenRef.current?.getBoundingClientRect()
    return (
      screen !== undefined &&
      event.clientX >= screen.left &&
      event.clientX <= screen.right &&
      event.clientY >= screen.top &&
      event.clientY <= screen.bottom
    )
  }

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    updatePointer(event)
    setPointer((current) => ({ ...current, visible: isInsideScreen(event) }))
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const inside = isInsideScreen(event)
    updatePointer(event)

    const screen = screenRef.current?.getBoundingClientRect()
    if (!screen) return

    setPointer((current) => ({ ...current, visible: inside }))
    setGlow({
      x: ((event.clientX - screen.left) / screen.width) * 100,
      y: ((event.clientY - screen.top) / screen.height) * 100,
      visible: inside,
    })
  }

  const updatePointer = (event: PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current?.getBoundingClientRect()
    if (!stage) return
    setPointer((current) => ({
      ...current,
      x: event.clientX - stage.left,
      y: event.clientY - stage.top,
    }))
  }

  const handlePointerLeave = () => {
    setPointer((current) => ({ ...current, visible: false, pressed: false }))
    setGlow((current) => ({ ...current, visible: false }))
  }

  return (
    <div className="product-page">
      <section
        className={`product-stage${isVisible ? ' is-visible' : ''}${selectedProduct ? ' is-detail' : ''}${selectedProduct === '华师匣子' ? ' is-xiazi-product' : ''}`}
        ref={stageRef}
        aria-labelledby="product-title"
      >
        <div
          className={`product-device${pointer.visible ? ' is-live' : ''}`}
          onPointerEnter={handlePointerEnter}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={(event) => {
            if (event.pointerType === 'mouse') {
              setPointer((current) => ({ ...current, pressed: true }))
            }
          }}
          onPointerUp={() => setPointer((current) => ({ ...current, pressed: false }))}
        >
          <div className="product-screen" ref={screenRef}>
            <ProductRipple screenRef={screenRef} imageRef={frameRef} />
            <ul className="product-apps">
              {apps.map((app) => (
                <li className="product-app" key={app.title}>
                  <button
                    className="product-app-button"
                    type="button"
                    aria-label={`查看${app.title}介绍`}
                    onClick={() => setSelectedProduct(app.title)}
                  >
                    <Image src={app.src} alt="" width={60} height={60} />
                  </button>
                </li>
              ))}
            </ul>
            <div
              className={`product-screen-glow${glow.visible ? ' is-visible' : ''}`}
              style={{ left: `${glow.x}%`, top: `${glow.y}%` }}
              aria-hidden="true"
            />
          </div>
          <Image className="product-device-frame" src={iphonePro} alt="" priority ref={frameRef} />
        </div>

        {selectedScreens && (
          <div className="product-gallery" aria-label={`${selectedProduct}应用界面`}>
            {selectedScreens.map((screen) => (
              <Image
                className="product-gallery-screen"
                key={`${selectedProduct}-${screen.name}`}
                src={screen.src}
                alt={`${selectedProduct}界面 ${screen.name}`}
                width={920}
                height={2000}
                style={{
                  left: `calc(${screen.left} * var(--u))`,
                  top: `calc(${screen.top} * var(--u))`,
                  width: `calc(${screen.width} * var(--u))`,
                  height: `calc(${screen.height} * var(--u))`,
                  '--r': `${screen.rotation}deg`,
                  '--d': `${screen.delay}s`,
                  zIndex: screen.layer,
                }}
              />
            ))}
          </div>
        )}

        <div
          className={`product-pointer${pointer.visible ? ' is-visible' : ''}${pointer.pressed ? ' is-pressed' : ''}`}
          style={{ transform: `translate3d(${pointer.x}px, ${pointer.y}px, 0)` }}
          aria-hidden="true"
        >
          <Image src={point} alt="" width={75} height={75} unoptimized />
        </div>

        <div className="product-copy">
          <h1 className="product-title" id="product-title" key={selectedProduct ?? 'overview'}>
            {selectedProduct ?? 'Our product'}
          </h1>
          {selectedProduct === '华师匣子' && (
            <>
              <p className="product-description">
                由华中师范大学木犀团队打造的官方校园应用，为华师学子量身定制
                <br />
                它不仅是你的随身课表和成绩查询利器
                <br />
                更整合了校园卡、空教室查找、图书馆管理等诸多实用功能
              </p>
              <a
                className="product-download"
                href="https://ccnubox.muxixyz.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                下载地址
              </a>
            </>
          )}
          {selectedProduct === '此行' && (
            <>
              <p className="product-description">
                看世界，从一个词开始
                <br />
                A New Way to Notice the World.
                <br />
                一个以关键词为驱动的观察与记录型图片 App，围绕关键词
                <br />
                引导用户主动观察世界，并完成主题式的照片收集目标
              </p>
            </>
          )}
          {selectedProduct === '木犀课栈' && (
            <p className="product-description">
              不知道选什么课？上课栈看看
              <br />
              一款针对于CCNU学生的选课手册，在这里你可以看到ccnuer对课程的详细评价
              <br />
              课程的成绩分布，老师风格，考核方式全都一目了然
            </p>
          )}
          {selectedProduct === '校灵通' && (
            <p className="product-description">
              一个整合校园各种活动的 APP
              <br />
              可以发布活动信息，寻找活动搭子，参加校外活动
              <br />
              在这里也可以分享活动感想，与他人在线互动
            </p>
          )}
          {!selectedProduct && (
            <>
              <p className="product-line product-line-one">校园无界</p>
              <p className="product-line product-line-two">青春不掉线</p>
              <p className="product-slogan">择木而犀</p>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
