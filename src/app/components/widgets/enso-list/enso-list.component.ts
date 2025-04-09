import { Component, OnInit } from "@angular/core";
import { environment } from "@env/environment";

const OPS = {
  tokenIn: '0x4200000000000000000000000000000000000006',
  tokenOut: '0xcd975e6a5F55137755487F0918b8ca74aCCe7925',
  amountIn: '1000000000000000000',
  primaryAddress: '0xCc0bDDB707055e04e497aB22a59c2aF4391cd12F',
  receiver: '',
};

@Component({
  selector: "app-enso-list",
  templateUrl: "./enso-list.component.html",
  styleUrls: ["./enso-list.component.scss"],
})
export class EnsoListComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    // Initialize the Enso API
    ensoApi.init();
  }

  async deposit() {
    const ops = {
      protocol: "velodrome-v2",
      args: {
          ...OPS,
      },
      action: "deposit",
    };
    const result = await fetch(
      `https://api.enso.finance/api/v1/standards`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${environment.enso_apikey}`,
        }
      }
    )
  }
}

export const ensoApi = {
  init: async () => {
    // here we are fetching information about the parameters we need to provide
    // to the bundle endpoint later
    const standards = await fetch(
      `https://api.enso.finance/api/v1/standards`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${environment.enso_apikey}`,
        }
      }
    ).then((res) => res.json());
    const usedStandards = standards
      .filter((standard: any) =>
        ["velodrome-v2", "erc20"].includes(standard.protocol.slug)
      )
      .map((standard: any) => ({
        protocol: standard.protocol.slug,
        actions: standard.actions
          .filter((action: any) =>
            ["deposit", "redeem"].includes(action.action)
          )
          .map((action: any) => ({ action: action.action, args: action.inputs })),
      }));
    console.log("Used standards:", usedStandards);
  },
};
