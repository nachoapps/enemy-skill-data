"""`

"""

import argparse
import logging
import yaml
import json

from pad_etl.data import database
from pad_etl.processor import enemy_skillset_dump as esd

fail_logger = logging.getLogger('processor_failures')
fail_logger.disabled = True

def parse_args():
    parser = argparse.ArgumentParser(description="Dumps data.", add_help=False)
    inputGroup = parser.add_argument_group("Input")
    inputGroup.add_argument("--monster_id", required=True, help="Monster ID")
    inputGroup.add_argument("--raw_input_dir", required=True,
                            help="Path to a folder where the raw input data is")
    inputGroup.add_argument("--es_input_dir", required=True,
                            help="Path to a folder where the enemy skills data is")

    helpGroup = parser.add_argument_group("Help")
    helpGroup.add_argument("-h", "--help", action="help",
                           help="Displays this help message and exits.")
    return parser.parse_args()


def run_dump(args):
    esd.set_data_dir(args.es_input_dir)

    db = database.Database('na', args.raw_input_dir)
    print('loading')
    db.load_database(skip_skills=True, skip_bonus=True, skip_extra=True)
    card = db.raw_card_by_id(args.monster_id)

    summary = esd.load_summary(args.monster_id)
    info = yaml.dump(summary.info, default_flow_style=False, allow_unicode=True)
    levels = {}

    for listing in summary.data:
        level_data = {
            'raw': yaml.dump(listing, default_flow_style=False, allow_unicode=True),
            'processed': esd.summary_as_dump_text(summary, card, listing.level, 1),
        }
        levels[listing.level] = level_data

    output = {
        'info': info,
        'levels': levels,
    }

    print(json.dumps(output, indent=2, sort_keys=True))


if __name__ == '__main__':
    args = parse_args()
    run_dump(args)
