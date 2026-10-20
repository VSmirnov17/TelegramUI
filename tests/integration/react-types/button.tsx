import { ComponentProps, ComponentPropsWithoutRef, createRef, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Button, ButtonProps } from '@telegram-apps/telegram-ui';

const button = createRef<HTMLButtonElement>();
const anchor = createRef<HTMLAnchorElement>();
const input = createRef<HTMLInputElement>();

const Field = forwardRef<HTMLInputElement, { field: string; size?: number } & ComponentPropsWithoutRef<'input'>>(
  ({ field, ...props }, ref) => <input {...props} name={field} ref={ref} />,
);
const Label = ({ label }: { label: string }) => <span>{label}</span>;

const native: ButtonProps = { size: 'm', type: 'submit', disabled: false };
const reflected: ComponentProps<typeof Button> = { type: 'submit', size: 'm' };
interface ExtendedButtonProps extends ButtonProps { label?: string }
const extended: ExtendedButtonProps = { loading: true };
const routed: ButtonProps<typeof Link> = { Component: Link, to: '/route', replace: true };
const linked: ButtonProps<'a'> = { Component: 'a', href: '/route', target: '_blank' };
const displayName: string | undefined = Button.displayName;
const exoticTag: symbol = Button.$$typeof;

export const Buttons = () => (
  <>
    <Button {...native} ref={button} onClick={(event) => { event.currentTarget.disabled = true; }} />
    <Button {...reflected} onClick={(event) => { event.currentTarget.disabled = true; }} />
    <Button {...extended} />
    <Button data-testid="action" aria-label="Action" before="Before" after="After" stretched loading />
    <Button ref={(element) => { element?.setAttribute('data-attached', 'true'); return () => element?.removeAttribute('data-attached'); }} />
    <Button Component="button" ref={button} onPointerDown={(event) => { event.currentTarget.disabled = true; }} />
    <Button Component="a" href="/route" ref={anchor} onClick={(event) => { event.currentTarget.href = '/next'; }} />
    <Button {...linked} ref={anchor} />
    <Button Component={Link} to="/route" state={{ from: '/' }} ref={anchor} onClick={(event) => { event.currentTarget.href = '/next'; }} />
    <Button Component={Link} to={{ pathname: '/route', search: '?page=1' }} ref={(element) => { element?.href; }} />
    <Button {...routed}>Open route</Button>
    <Button {...routed} ref={anchor} />
    <Button Component={Field} field="name" ref={input} size="s" disabled onChange={(event) => { event.currentTarget.value = 'changed'; }} />
    <Button Component={Label} label="Action" mode="plain" />
  </>
);

// @ts-expect-error a Router Link requires to
const missingRoute = <Button Component={Link} />;
// @ts-expect-error Router destinations must be strings or path objects
const invalidRoute = <Button Component={Link} to={42} />;
// @ts-expect-error a Link forwards an anchor ref
const invalidRouteRef = <Button Component={Link} to="/route" ref={button} />;
// @ts-expect-error anchor events cannot access button-only fields
const invalidRouteEvent = <Button Component={Link} to="/route" onClick={(event) => { event.currentTarget.disabled = true; }} />;
// @ts-expect-error a native anchor forwards an anchor ref
const invalidAnchorRef = <Button Component="a" href="/route" ref={button} />;
// @ts-expect-error native anchor handlers have an anchor currentTarget
const invalidAnchorEvent = <Button Component="a" onClick={(event) => { event.currentTarget.disabled = true; }} />;
// @ts-expect-error a native button forwards a button ref
const invalidButtonRef = <Button ref={anchor} />;
// @ts-expect-error default events have a button currentTarget
const invalidButtonEvent = <Button onClick={(event) => { event.currentTarget.href = '/'; }} />;
// @ts-expect-error to requires an actual Component override
const routeWithoutComponent = <Button to="/route" />;
// @ts-expect-error native attributes remain checked
const misspelledHref = <Button Component="a" hrfe="/route" />;
// @ts-expect-error inferred custom props cannot admit arbitrary fields
const unknownRouteProp = <Button Component={Link} to="/route" unknownProp />;
// @ts-expect-error the custom field name is required
const missingField = <Button Component={Field} />;
// @ts-expect-error custom input refs must refer to inputs
const invalidFieldRef = <Button Component={Field} field="name" ref={anchor} />;
// @ts-expect-error a plain function without a ref prop does not gain one
const invalidLabelRef = <Button Component={Label} label="Action" ref={anchor} />;
// @ts-expect-error Button's own size is a visual size, not the input's numeric size
const invalidSize = <Button Component={Field} field="name" size={3} />;
// @ts-expect-error Button's own modes remain checked with custom components
const invalidMode = <Button Component={Link} to="/route" mode="invalid" />;
// @ts-expect-error specifying the props generic does not render the custom component
const missingTypedComponent = <Button<typeof Link> to="/route" />;
// @ts-expect-error exported override props retain required Router props
const missingTypedRoute: ButtonProps<typeof Link> = { Component: Link };
// @ts-expect-error exported default props describe a native button
const invalidNativeProps: ButtonProps = { href: '/route' };
