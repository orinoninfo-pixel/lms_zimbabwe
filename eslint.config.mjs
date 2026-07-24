import nextVitals from "eslint-config-next/core-web-vitals"

const eslintConfig = [
	...nextVitals,
	{
		ignores: [
			"lib/generated/**",
			".next/**",
			"node_modules/**",
			"coverage/**",
			"playwright-report/**",
			"test-results/**",
		],
	},
	{
		rules: {
			// Existing app patterns trigger these heavily; keep lint signal focused on actionable issues.
			"react-hooks/set-state-in-effect": "off",
			"react-hooks/purity": "off",
		},
	},
]

export default eslintConfig
