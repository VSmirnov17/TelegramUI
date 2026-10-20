import { createRef, useRef, useState } from 'react';
import {
  AppRoot, Chip, Input, Modal, Multiselect, Popper, SegmentedControl, Tabbar, TabsList, Timeline,
} from '@telegram-apps/telegram-ui';
import { MultiselectBase } from '@telegram-apps/telegram-ui/dist/components/Form/Multiselect/components/MultiselectBase/MultiselectBase';
import '@telegram-apps/telegram-ui/dist/styles.css';

export const Consumer = () => {
  const portal = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLButtonElement>(null);
  const modal = useRef<HTMLDivElement>(null);
  const tabbar = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  return (
    <AppRoot portalContainer={portal}>
      <AppRoot ref={(node) => {
        node?.setAttribute('data-attached', 'true');
        return () => { node?.removeAttribute('data-attached'); };
      }} />
      <Input ref={input} value={value} onChange={(event) => setValue(event.currentTarget.value)} />
      <button ref={target} onClick={() => setOpen(true)}>Open</button>
      <Popper targetRef={target}>Popup</Popper>
      <Modal ref={modal} open={open} onOpenChange={setOpen}>Form</Modal>
      <Multiselect value={[]} options={[{ value: 'one', label: 'One' }]} renderChip={(props) => <Chip {...props} mode="outline" />} />
      <MultiselectBase inputRef={input} chipsValue={[]} onAddChipOption={() => {}} onRemoveChipOption={() => {}} />
      <TabsList>{[<TabsList.Item key="one" selected>One</TabsList.Item>]}</TabsList>
      <SegmentedControl>{[<SegmentedControl.Item key="one" selected>One</SegmentedControl.Item>]}</SegmentedControl>
      <Timeline>{[<Timeline.Item key="one">One</Timeline.Item>]}</Timeline>
      <Tabbar ref={tabbar}>{[<Tabbar.Item key="one" selected>One</Tabbar.Item>]}</Tabbar>
    </AppRoot>
  );
};

// @ts-expect-error platform names must remain checked
const invalidPlatform = <AppRoot platform="android" />;
// @ts-expect-error custom chips must return an element
const invalidChip = <Multiselect value={[]} options={[]} renderChip={() => 'chip'} />;
// @ts-expect-error a ref to an SVG cannot receive the modal's div
const invalidModal = <Modal ref={createRef<SVGSVGElement>()} />;
// @ts-expect-error target refs must refer to elements
const invalidTarget = <Popper targetRef={{ current: 42 }} />;
// @ts-expect-error input change handlers receive a DOM event, not a string
const invalidChange = <Input onChange={(value: string) => value} />;
