"use client";

// 成员卡：徽章 + 头像框 + 姓名 + 两行简介（版式见 intro.scss 的 .member-card）
import React from "react";
import type { MemberCard as MemberCardData } from "./member";

function MemberCard({ member }: { member: MemberCardData }) {
	return (
		<article className="member-card">
			<span className={`member-badge${member.lead ? " is-lead" : ""}`}>{member.badge}</span>
			<span className="member-avatar">
				<img src={member.photo} alt="" draggable={false} />
			</span>
			<h3 className="member-name">{member.name}</h3>
			<p className="member-desc">{member.intro}</p>
		</article>
	);
}

export default MemberCard;
