"use client";

import React from "react";
import "./join.scss";
import Petal from "../petal/petal";
export default function Join() {
	function handleJoin() {
		window.location.href = "http://fresh.muxixyz.com/";
	}
	return (
		<div>
			<Petal />
			<div className="join-web">
				<div className="background-img-container">
					<img
						src="http://static.muxixyz.com/index_site/join2.png"
						className="background-star"
					/>
				</div>

				<div className="background-button-container">
					<img
						src="http://static.muxixyz.com/index_site/join_button.png"
						className="background-button-inner"
						onClick={() => handleJoin()}
					/>
				</div>
			</div>
		</div>
	);
}
