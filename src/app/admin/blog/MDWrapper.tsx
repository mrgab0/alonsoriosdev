"use client";

import React from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";

export default function MDWrapper(props: any) {
  // Configuración extendida con absolutamente todas las funciones posibles
  const customCommands = [
    commands.bold,
    commands.italic,
    commands.strikethrough,
    commands.hr,
    commands.group(
      [
        commands.title1,
        commands.title2,
        commands.title3,
        commands.title4,
        commands.title5,
        commands.title6,
      ],
      {
        name: "title",
        groupName: "title",
        buttonProps: { "aria-label": "Insert title" },
      }
    ),
    commands.divider,
    commands.link,
    commands.quote,
    commands.code,
    commands.codeBlock,
    commands.comment,
    commands.image,
    commands.table,
    commands.divider,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.checkedListCommand,
    commands.issue,
    commands.help,
  ];

  const extraCommands = [
    commands.codeEdit,
    commands.codeLive,
    commands.codePreview,
    commands.fullscreen,
  ];

  return (
    <div data-color-mode="dark">
      <MDEditor
        {...props}
        commands={customCommands}
        extraCommands={extraCommands}
      />
    </div>
  );
}
