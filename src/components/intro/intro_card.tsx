"use client";

import React, { useState } from "react";
import "./intro.scss";

interface childProps {
	tag: string;
	info: { position: string; intro: string; name: string; photo: string };
}

const Card: React.FC<childProps> = (props: {
	info: { position: string; photo: any; name: any; intro: any };
	tag: any;
}) => {
	const [isError, setIsError] = useState(true);
	const defaultImg = "http://static.muxixyz.com/workbench/avatar/14.png";
	//// 只调用一次onError 防止默认图加载不出来导致死循环
	const handleImageError = (e: any) => {
		if (isError) {
			setIsError(false);
			e.target.src = defaultImg;
		}
	};

	let positionColor = "rgb(170, 170, 170)";
	if (props.info.position === "组长") {
		positionColor = "rgb(253, 172, 31)";
	} else if (props.info.position !== "组员") {
		positionColor =
			"linear-gradient(to right, rgb(29,99,158), rgb(57,179,161))";
	}

	return (
		<div className="intro-card-father">
			<div className="intro-card">
				{/* <div className = "intro-photo" style = {{backgroundImage:`url(${props.info.photo})`}}></div>  */}
				<div className="intro-photo">
					<img
						src={props.info.photo}
						ref={(img: any) => {
							img = img;
						}}
						onError={handleImageError}
					/>
				</div>

				<div className="intro-position" style={{ background: positionColor }}>
					{props.info.position}
				</div>
				<div className="intro-name">姓名：{props.info.name}</div>
				<div className="intro-tag">组别：{props.tag}</div>
				<div className="intro-content">
					<div className="intro-words-container">
						<div className="intro-words">介绍</div>
						{props.info.intro}
					</div>
				</div>
			</div>
		</div>
	);
};
export default Card;
