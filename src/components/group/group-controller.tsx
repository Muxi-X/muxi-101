"use client";

// 切换组别的中心花瓣
import group from "./const";
import React, { useState } from "react";

const groupNum: number = 6;

interface GroupControllerProps {
	selectGroup: (targetGroup: number) => void;
	initGroup: number;
}

function GroupController({
	initGroup,
	selectGroup,
}: GroupControllerProps): React.ReactElement {
	const [current, setCurrent] = useState(initGroup);
	const [rotate, setRotate] = useState(initGroup * (360 / groupNum));

	const handleClick = (targetGroup: number) => {
		selectGroup(targetGroup);
		setCurrent(targetGroup);
		setRotate(getNearestRotation(rotate, targetGroup * (360 / groupNum)));
	};

	function getNearestRotation(currentAngle: number, targetAngle: number) {
		let diff = targetAngle - currentAngle;
		if (diff > 180) {
			diff -= 360;
		} else if (diff < -180) {
			diff += 360;
		}
		return diff + currentAngle;
	}

	/* 
	这里关于就近移动曾采用过以下思路
	1.通过useRef确定上一次的索引和本次索引，通过二维数组映射表来判断顺时针和逆时针的旋转
	2.使用方法1后发现效果和预期不同，决定使用全为正数的角度，达到自动就进或者只顺时针转
	3.使用方法2后发现效果和预期不同，开始查询rotate()原理
	4.发现rotate()存在旋转 180°也被称为点反射现象
	5.之后为了实现就近移动可能的思路：把改变后的rotate度数看作一个状态，每次旋转后都重置这个状态
	从而避免撞180deg的墙而导致反向绕大圈（通过重置状态每次只在正负180deg的范围内移动）
	*/
	return (
		<div className="group-controller-box">
			<div className="group-controller">
				<div className="circle-menu">
					<div
						className="circle-menu-round"
						style={{
							//动画时间
							transitionDuration: ".8s",
							// 转动角度
							transform: `rotate(${rotate}deg)rotateY(${rotate * groupNum}deg)`,
						}}
					>
						<div className="circle-menu-dot"></div>
					</div>
					{/* 可点击组名 */}
					<ul className="group-list">
						{group.map((item, i) => (
							<li className="group-item" key={i}>
								<a
									className={`circle-menu-${i} ${
										current == i ? "onGroup" : "notOnGroup"
									}`}
									onClick={() => handleClick(i)}
								>
									{item.name}
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

export default GroupController;
