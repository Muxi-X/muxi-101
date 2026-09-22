"use client";

import React, { useState, useEffect } from "react";
import "./banner.scss";
import config from "./const.js";

interface childProps {
	key1: number;
	count: number;
}

const BannerItem: React.FC<childProps> = (props) => {
	//解构赋值，父子组件通信传值
	const { key1, count } = props;
	//这里先把key全换成key1  因为会报错
	const [product, setProduct] = useState(config[key1].product);
	const [type, setType] = useState(config[key1].type);
	const [intro, setIntro] = useState(config[key1].intro);
	const [href, setHref] = useState(config[key1].href);
	const [img, setImg] = useState(config[key1].img);
	//const [icon,setIcon]=useState(config[props.key].icon);

	const _link = () => {
		window.location.href = href;
	};

	useEffect(() => {
		return () => {
			setProduct(product);
			setType(type);
			setIntro(intro);
			setHref(href);
		};
	}, []);

	let width = 100 / count + "%";

	return (
		<div className="products-intro" style={{ width: width }}>
			<div className="products-content products-on">
				<div className="products-introduction">
					<div className="products-introduction-content">
						<h1>{product}</h1>

						<div className="products-des">
							<div className="products-des-icon" />
							<span className="products-des-txt">{type}</span>
						</div>
						<div className="products-description">{intro}</div>
						<button className="products-btn" onClick={_link.bind(this)}>
							{key1 == 0 ? "下载地址" : "进入链接"}
						</button>
					</div>
				</div>

				<div
					className="products-img"
					style={{ backgroundImage: `url(${img})` }}
				/>
			</div>
		</div>
	);
};

export default BannerItem;
