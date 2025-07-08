import React from "react";
import { render } from "@testing-library/react";
import PrimaryInfoFormComponent from "../PrimaryInfoFormComponent";
import { noop } from "../../../Testing";

test("should render without error", () => {
	expect(() => {
		render(
			<PrimaryInfoFormComponent
				register={noop as any}
				errors={noop as any}
				getValues={noop as any}
				setValue={noop as any}
				watch={noop as any}
			/>
		);
	}).not.toThrow();
});
