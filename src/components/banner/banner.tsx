"use client";

import React, { useState } from "react";
import BannerItem from "./banner-item";
import BannerController from "./banner-controller";
import "./banner.scss";
import config from "./const.js";

const Banner: React.FC = () => {
	const countPage: number = config.length;
	const [currentPage, setCurrentPage] = useState(0);
	const [icon, setIcon] = useState(config[0].icon);

	const updateItem = (e: any) => {
		if (
			!(
				(currentPage <= 0 && e == -1) ||
				(currentPage >= countPage - 1 && e == 1)
			)
		) {
			setCurrentPage(currentPage + e);
			setIcon(config[currentPage + e].icon);
		}
	};

	const chooseBanner = (index: any) => {
		setCurrentPage(index);
		setIcon(config[currentPage].icon);
	};

	let width = countPage * 100 + "%";
	//生成0到countPage-1的数组
	let indexArray = Array.from(new Array(countPage), (val, index) => index);

	return (
		<div className="products-wrap">
			<div
				className="products-banner"
				style={{
					width: width,
					transitionDuration: ".8s",
					left: -100 * currentPage + "%",
				}}
			>
				{indexArray.map((item, i) => (
					<BannerItem key1={item} count={countPage} key={i} />
				))}
			</div>
			<BannerController
				update={updateItem}
				current={currentPage}
				count={countPage}
				choose={chooseBanner}
			/>
		</div>
	);
};
export default Banner;
