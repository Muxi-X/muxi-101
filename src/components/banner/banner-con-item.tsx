//没懂在干什么
import React from "react";
import "./banner.scss";

interface childProps {
	item: string; //为product
}

const BannerController: React.FC<childProps> = (props) => {
	return <div className="products-item">{props.item}</div>;
};

export default BannerController;

// //类型“{}”上不存在属性xxx
// //解决办法：添加泛型childProps
