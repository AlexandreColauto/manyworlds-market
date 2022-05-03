import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
interface callback {
  callback: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function CustomLabelExample(props: callback) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    callProps();
  }, [enabled]);

  const callProps = () => {
    props.callback(enabled);
  };
  return (
    <Switch.Group>
      <div className="flex items-center">
        <Switch
          checked={enabled}
          onChange={setEnabled}
          className={`${
            enabled ? "bg-[#F2F2F2]" : "bg-[#F2F2F2]"
          } relative inline-flex items-center  h-14 rounded-full w-[150px] transition-colors focus:outline-none  focus:ring-offset-2 focus:ring-indigo-500`}
        >
          <span
            className={`${
              enabled
                ? "translate-x-[5.6rem] w-[3.6rem]"
                : "translate-x-1 w-[5.6rem]"
            } inline-block  h-12 transform bg-[#404D3A] rounded-full  transition-transform`}
          />
          <div className="absolute w-full">
            <div className="flex justify-center">
              <p
                className={`${
                  !enabled ? "text-[#E8C39C]" : "text-[#404D3A]"
                } mr-4`}
              >
                Collection{" "}
              </p>
              <p
                className={`${
                  enabled ? "text-[#E8C39C]" : "text-[#404D3A]"
                } mr-1`}
              >
                {" "}
                NFT{" "}
              </p>
            </div>
          </div>
        </Switch>
      </div>
    </Switch.Group>
  );
}
