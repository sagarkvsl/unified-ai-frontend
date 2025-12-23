export const runtime = 'edge'
// TODO
/*
  1) Convert PageNotFound.module.less in fe-common-service to PageNotFound.module.css as the nextjs doesn't support less;
  2) Render PageNotFound component from @dtst/react-ui-components in this component
*/
export default function NotFound() {
	return (
		<div>
			<h2>Not Found</h2>
			<p>Could not find requested resource</p>
		</div>
	)
}
