/**
 * Module core/webidl-clipboard
 *
 * This module adds a button to each IDL pre making it possible to copy
 * well-formatted IDL to the clipboard.
 *
 */
import Clipboard from "clipboard";
export const name = "core/webidl-clipboard";

const clipboardOps = {
  text: trigger => {
    return document
      .querySelector(trigger.dataset.clipboardTarget)
      .textContent.replace(/ +/gm, " ")
      .replace(/^ /gm, "  ")
      .replace(/^};\n/gm, "};\n")
      .trim();
  },
};

async function loadImage() {
  try {
    return (await import("text!../../assets/clipboard.svg")).default;
  } catch {
    const res = await fetch(
      new URL("../../assets/clipboard.svg", import.meta.url)
    );
    return await res.text();
  }
}

export async function run() {
  // This button serves a prototype that we clone as needed.
  const copyButton = document.createElement("button");
  copyButton.innerHTML = await loadImage();
  copyButton.title = "Copy IDL to clipboard";
  copyButton.classList.add("respec-button-copy-paste", "removeOnSave");

  Array.from(document.querySelectorAll("pre.idl"))
    .map(elem => {
      const button = copyButton.cloneNode(true);
      const definition = elem.querySelector(
        `span[id^="idl-def-"], span[id^="dom-"]`
      );
      let target = "#";
      if (definition === null && elem.id === "") {
        if (elem.parentElement.id === "idl-index") {
          target += "actual-idl-index";
        } else {
          elem.id = `idl-${String(Math.random()).substr(2)}`;
          target += elem.id;
        }
      } else {
        target += elem.id || definition.id;
      }
      return { button, elem, target };
    })
    .forEach(({ elem, button, target }) => {
      const wrapper = document.createElement("div");
      button.dataset.clipboardTarget = target;
      elem.parentElement.replaceChild(wrapper, elem);
      wrapper.appendChild(button);
      wrapper.appendChild(elem);
    });
  const clipboard = new Clipboard(".respec-button-copy-paste", clipboardOps);
  clipboard.on("success", e => e.clearSelection());
}
