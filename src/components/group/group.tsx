"use client";

import { useState } from "react";
import group from "./const";
import { CSSTransition } from "react-transition-group";
import GroupController from "./group-controller";
import Flower from "../flower/flower";
import "./group.scss";

function Group() {
	const [store, setStore] = useState(0);
	return (
		<div className="wrapper">
			<Flower />
			<div className="group-content-box">
				<div className="group-content">
					<div className="group-left">
						<div className="group-left-content">
							<h1 className="group-name">{group[store].name}</h1>
							<div className="group-intro">{group[store].intro}</div>
							<br />
							<div className="group-learn">
								<p>学习技能:</p>
								{group[store].learn}
							</div>
						</div>
					</div>
					<GroupController selectGroup={setStore} initGroup={store} />
					<div className="group-right">
						<img src={group[store].img} alt="" />
					</div>
				</div>
			</div>
		</div>
	);
}

export default Group;
