import ReactGA from 'react-ga';
import React from 'react';


export default function HowTo() {
  ReactGA.pageview('/howto');
  return (
    <div className="howto">
      <ol>
        How to use the gear optimizer:
      </ol>
      <ol>
        <li>Perform the global item setup based on game progress.</li>
        <ul>
          <li>Select your highest zone.</li>
          <li>If applicable, select the highest version of your highest titan.</li>
          <li>Select your highest looty version.</li>
          <li>Select your highest ascended pendant version.</li>
          <li>Select your number of accessory slots.</li>
        </ul>
        <br />
        <li>Perform additional custom item configuration in the item list on the right.</li>
        <ul>
          <li>Open/close a particular zone&apos;s item list by clicking the zone name.</li>
          <li>Rightclick an item in the list to open the item editing menu.</li>
          <li>In the item editing menu enable or disable the item, or change its level.</li>
          <li>Equip an item from the list by clicking it.</li>
          <li>
            Equiped items can be locked by rightclicking it in the equipped item list on the left.
          </li>
        </ul>
        <br />
        <li>Configure base Power / Toughness, Infinity Cube, and hard cap information.</li>
        <ul>
          <li>
            Base and cube PT are straightforward. Cube tier is automatically calculated if you
            change the cube PT, but can be adjusted manually.
          </li>
          <li>
            If you are nearing the hard cap for a specific value (e.g. EM cap), then the gear
            optimizer can take this into account. Enter your current gear bonus and current total in
            the appropriate fields.
          </li>
          <li>
            Example: with +50,000% Energy Cap you have 7E+18 total Energy Cap. Then enter 500 in
            the &quot;Energy Cap Gear&quot; field, and 7E+18 in the &quot;Total Energy
            Cap&quot; field. Note that the gear bonus is taken from the inventory, the stat
            breakdown would say 50,100% in this case.
          </li>
        </ul>
        <br />
        <li>Select your priorities.</li>
        <ul>
          <li>Priorities are handled from top (Priority 1) to bottom.</li>
          <li>
            When optimizing for a priority, the optimizer computes the optimal loadout for this
            priority, for any remaining empty slots that were not used by previous priorities.
          </li>
          <li>
            The slots amount limits the number of additional accessory slots that can be used for
            this priority.
          </li>
          <li>
            Of course, the global accessory slot limit always applies, it might be the case that
            no slots remain for a priority lower down the list.
          </li>
        </ul>
        <br />
        <li>
          Click the &quot;Optimize Gear&quot; button to compute an optimal loadout based on the
          configuration.
        </li>
        <br />
        <li>Save and compare loadouts.</li>
        <ul>
          <li>
            The stats list shows the stats of the current loadout and the difference with the
            currently selected save slot.
          </li>
          <li>
            The default save slot is empty. Overwriting the last save slot creates a new empty
            save at the next save index.
          </li>
          <li>
            Saving / load / delete save slots by clicking the appropriate buttons. Navigate saves
            by incrementing / decrementing the save index.
          </li>
          <li>
            Deleting a slot results in the removal of that save, all saves with a higher index
            have their index decremented by 1.
          </li>
          <li>
            The current saved loadout can be shown or hidden by clicking the Show / Hide button.
          </li>
        </ul>
      </ol>
      <br />
      <ol>
        How to use the augments calculator:
      </ol>
      <ol>
        <li>Fill in the fields and then check which augment gives the best boost.</li>
        <li>
          Augment speed is whatever you find in the breakdown, but divide by 100 to remove the
          &quot;%&quot;-sign.
        </li>
        <li>Time is in minutes.</li>
        <li>
          Ratio is the energy in augment : energy in upgrade, where the latter is always 1. If you
          want for example 3.4:2, then enter 1.7.
        </li>
      </ol>
      <br />
      <ol>
        How to use the NGUs calculator:
      </ol>
      <ol>
        <li>Fill in the fields and then check which NGU gives the best boost.</li>
        <li>
          NGU speed is whatever you find in the breakdown, but divide by 100 to remove the
          &quot;%&quot;-sign.
        </li>
        <li>Time is in minutes.</li>
        <li>
          Keep in mind that the calculator assumes you assign all your E or M to a single NGU.
        </li>
      </ol>
      <br />
      <ol>
        How to use the hacks calculator:
      </ol>
      <ol>
        <li>
          Fill in the fields and then choose one of the three options (target, max level, max
          MS).
        </li>
        <li>
          MS means milestone. MS reducers is how much you have lowered the number of levels between
          milestones. E.g. if the default levels per milestone is 10, but it&apos;s 8 for you, then
          you fill in 2.
        </li>
        <li>
          Hack speed is whatever you find in the breakdown, but divide by 100 to remove the
          &quot;%&quot;-sign.
        </li>
        <li>Time is in minutes.</li>
        <li>
          Min total time assumes you run Hack Hack first. Max total time assumes you run Hack Hack
          last, this is a sum of the times in the &apos;Time&apos; column, which are based on
          current hack speed.
        </li>
      </ol>
      <br />
      <ol>
        How to use the wishes calculator:
      </ol>
      <ol>
        <li>
          Provide the required data in all input fields, please consider scientific notation, e.g.
          1e6 instead of 1000000, or have fun counting zeroes.
        </li>
        <li>Power is total power, cap is amount you actually want to spend on wishes.</li>
        <li>
          For example: if you value hacks and wishes equally, then you could set R3 cap to 22.44%
          of your total R3 cap.
        </li>
        <li>
          Take the wish speed modifier from the breakdown menu and write it as a decimal, i.e.
          &quot;100%&quot; becomes &quot;1.00&quot;.
        </li>
        <li>Minimal wish time, is the time you want the final level to take.</li>
        <li>Select some wishes, start levels, and target levels.</li>
        <li>Decide the order in which resources should be spent.</li>
        <li>
          A possible allocation of EMR cap will be suggested to reach the target level in each of
          these wishes in (close to) the shortest possible time. This procedure is stochastic, so
          reruns might result in (slightly) different values.
        </li>
      </ol>
    </div>
  );
}
