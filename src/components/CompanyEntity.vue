<template>
  <div class="company-entity">
    <img :src="entity.avatar || '/logo.png'" alt="Logo" class="avatar" />

    <div class="company-entity__info">
      <div class="company-entity__name">
        {{ entity.companyName || entity.alias }}
      </div>

      <div class="company-entity__signature">
        Компания
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { EntityPropsInterface } from '@/interfaces/EntityProps';

export default defineComponent({
  props: {
    entity: {
      type: Object as PropType<EntityPropsInterface>,
      required: true,
    },
  },
});
</script>

<style scoped lang="scss">
.company-entity {
  display: flex;
  align-items: center;
  gap: 10px;

  &__avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

  &__info {
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-weight: bold;
  }

  &__signature {
    color: gray;
  }
}
</style>