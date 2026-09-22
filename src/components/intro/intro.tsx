"use client";

import React, { useState } from "react";
import "./intro.scss";
import info from "./info";
import Card from "./intro_card";
import Introgroup from "./intro-controller";
import Petal from "../petal/petal";

const Intro: React.FC = () => {
	const information = info;
	const [currentTag, setCurrentTag] = useState("后端");
	const [currentGroup, setCurrentGroup] = useState(0);

	const selectGroup = (e: number) => {
		setCurrentGroup(e);
		setCurrentTag(information[e].tag);
	};
	return (
		<div>
			<Petal />
			<div className="intro-card-containner">
				{information[currentGroup].people.map((person, index) => {
					return <Card info={person} tag={currentTag} key={index} />;
				})}
			</div>

			<Introgroup select={selectGroup} current={currentGroup} />
		</div>
	);
};
export default Intro;
