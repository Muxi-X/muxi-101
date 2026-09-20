"use client";

import React, { useState, useEffect } from "react";
import "./banner.scss";
import config from "./const.js";

interface childProps {
	count: number;
	update: Function;
	choose: Function;
	current: number;
}

const BannerController: React.FC<childProps> = (props) => {
	//解构赋值，父子组件通信传值
	const { count, update, choose } = props;

	const [current, setCurrent] = useState(props.current);
	const [items, setItems] = useState<string[] | null>(null);
	//const [flag,setFlag]=useState('left');

	useEffect(() => {
		let items: any = [];
		config.forEach((e: { product: any }) => {
			items.push(e.product);
		});
		//原代码this.setState({ items })  对hooks——访问useEffect里面的变量需要用到useState
		setItems(items);
	}, []);

	const switchLeft = () => {
		update(-1);
		if (current !== 0) {
			setCurrent(current - 1);
		}
	};
	const switchRight = () => {
		update(1);
		if (current !== config.length - 1) {
			setCurrent(current + 1);
		}
	};
	const chooseProduct = (i: any) => {
		choose(i);
		setCurrent(i);
	};

	let class1 = "products-item products-center";
	let class2 = "products-item";

	return (
		<div className="products-bottom">
			<div className="products-controller">
				<div className="controller-btn btn-left" onClick={switchLeft} />
				<div className="products-cnt-text">
					<div className="products-camera-bgr">
						<div className="products-camera-bgr-inner"> </div>
						<div className="products-camera-bgr-inner2" />
					</div>
					<div
						className="text"
						style={{
							transitionDuration: ".8s",
							width: `${184 * count}px`,
							left: `calc(50vw - 122px - ${props.current * 184}px)`, // 调整偏移量
						}}
					>
						{items?.map((item: string, i: number) => (
							<div
								key={i}
								className={`${current === i ? class1 : class2}`}
								onClick={chooseProduct.bind(this, i)} //this.chooseProduct.bind(this, i)原来的
							>
								{item}
							</div>
						))}
					</div>
				</div>
				<div className="controller-btn btn-right" onClick={switchRight} />
			</div>

			<div className="products-camera-containner">
				<div className="products-camera"> </div>
				<div
					//
					className="prodcuts-icon"
					style={{ backgroundImage: `url(${config[current].icon})` }}
				/>
			</div>
		</div>
	);
};
export default BannerController;
