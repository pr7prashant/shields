'use strict'

const Joi = require('@hapi/joi')
const { downloadCount } = require('../color-formatters')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const ansibleRoleSchema = Joi.object({
  download_count: nonNegativeInteger,
  name: Joi.string().required(),
  summary_fields: Joi.object({
    namespace: Joi.object({
      name: Joi.string().required(),
    }),
  }),
}).required()

class AnsibleGalaxyRole extends BaseJsonService {
  async fetch({ roleId }) {
    const url = `https://galaxy.ansible.com/api/v1/roles/${roleId}/`
    return this._requestJson({
      url,
      schema: ansibleRoleSchema,
    })
  }
}

class AnsibleGalaxyRoleDownloads extends AnsibleGalaxyRole {
  static category = 'downloads'
  static route = { base: 'ansible/role/d', pattern: ':roleId' }

  static examples = [
    {
      title: 'Ansible Role',
      namedParams: { roleId: '3078' },
      staticPreview: this.render({ downloads: 76 }),
    },
  ]

  static defaultBadgeData = { label: 'role downloads' }

  static render({ downloads }) {
    return {
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  async handle({ roleId }) {
    const json = await this.fetch({ roleId })
    return this.constructor.render({ downloads: json.download_count })
  }
}

class AnsibleGalaxyRoleName extends AnsibleGalaxyRole {
  static category = 'other'
  static route = { base: 'ansible/role', pattern: ':roleId' }

  static examples = [
    {
      title: 'Ansible Role',
      namedParams: { roleId: '3078' },
      staticPreview: this.render({
        name: 'ansible-roles.sublimetext3_packagecontrol',
      }),
    },
  ]

  static defaultBadgeData = { label: 'role' }

  static render({ name }) {
    return { message: name, color: 'blue' }
  }

  async handle({ roleId }) {
    const json = await this.fetch({ roleId })
    const name = `${json.summary_fields.namespace.name}.${json.name}`
    return this.constructor.render({ name })
  }
}

module.exports = {
  AnsibleGalaxyRoleDownloads,
  AnsibleGalaxyRoleName,
}
