export class test {
	/**
	 * @category Tests AAA
	 */
	static readonly AAA = 'begin';
	/**
	 * @category EEE AAA
	 * @group Tests
	 */
	static readonly BEGIN = 'begin';

	/**
	 * The `@event` tag is equivalent to `@group Events`
	 * @event
	 */
	static readonly PARSE_OPTIONS = 'parseOptions';

	/**
	 * The `@eventProperty` tag is equivalent to `@group Events`
	 * @eventProperty
	 */
	static readonly END = 'end';

	/**
	 * 计算两个数相交
	 * @remarks
	 * ```ts
	 * 	const aab:number = 1;
	 * ```
	 *
	 * @param a 第一个数
	 * @param b 第二个数
	 * @returns 两个数相加的结果
	 *
	 * @example
	 * If there is a code block, then both TypeDoc and VSCode will treat
	 * text outside of the code block as regular text.
	 * ```ts
	 * factorial(1)
	 * ```
	 */
	aaa = (a: number, b: string) => {
		return a + Number(b);
	};
}
